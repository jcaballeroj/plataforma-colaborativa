#!/usr/bin/env python3
"""
Simula varios usuarios enviando mensajes privados a la vez.

Cada "persona" inicia sesión por HTTP (igual que un navegador) y envía mensajes a
POST /chat/private/{id}. Así se ejecuta el flujo real de la app: guardado, broadcast
por Reverb y notificación. Cada persona corre en su propio hilo, por lo que los
mensajes se envían de forma realmente simultánea.

Requisitos:
    pip install requests pymysql cryptography

Uso (desde la raíz del proyecto, con `php artisan serve` y `php artisan reverb:start` corriendo):
    python scripts/simulate_chat.py
    python scripts/simulate_chat.py --senders 6 --messages 60 --delay-min 200 --delay-max 1500
    python scripts/simulate_chat.py --to colaborador@collab.com --to admin@collab.com
"""

import argparse
import random
import sys
import threading
import time
from pathlib import Path
from urllib.parse import unquote

import pymysql
import requests

PHRASES = [
    "Hola, ¿tienes un minuto para revisar el avance del proyecto?",
    "Te acabo de asignar una tarea, échale un vistazo cuando puedas.",
    "¿Pudiste revisar mi pull request?",
    "Buenos días, ¿ya tienes el informe de ayer?",
    "Reunión a las 3 pm, ¿confirmas asistencia?",
    "Gracias por la ayuda con el bug, ya quedó resuelto.",
    "¿Podemos mover la reunión de seguimiento para mañana?",
    "Ya subí los archivos al proyecto.",
    "Necesito tu opinión sobre el diseño de la pantalla principal.",
    "Recuerda que la entrega es el viernes.",
    "¿Cómo vas con la tarea de documentación?",
    "Perfecto, quedo atento a tus comentarios.",
    "Hay un error en producción, ¿puedes ayudarme a revisarlo?",
    "Listo, ya hice el despliegue en el entorno de pruebas.",
    "¿Me compartes el enlace de la demo?",
    "Excelente trabajo en la presentación de hoy.",
    "Voy a tardar un poco más con mi parte, te aviso apenas termine.",
    "¿Quién se encarga de la revisión de calidad esta semana?",
    'Ya actualicé el estado de la tarea a "en progreso".',
    "Hablemos en la llamada de las 10, tengo varias dudas.",
    "Te envié el borrador por correo, dime qué opinas.",
    "¿Alguien más tiene acceso al repositorio?",
    "Todo claro, empiezo hoy mismo.",
    "Gracias, me sirve mucho.",
    "Pendiente tu respuesta sobre el presupuesto.",
]

print_lock = threading.Lock()


def log(msg: str) -> None:
    with print_lock:
        print(msg, flush=True)


def read_env(path: str) -> dict:
    """Lee un archivo .env simple (KEY=VALUE) sin dependencias externas."""
    env = {}
    p = Path(path)
    if not p.exists():
        sys.exit(f"No se encontró el archivo .env en: {p.resolve()}")
    for line in p.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        env[key.strip()] = value.strip().strip('"').strip("'")
    return env


def connect_db(env: dict):
    return pymysql.connect(
        host=env.get("DB_HOST", "127.0.0.1"),
        port=int(env.get("DB_PORT", 3306)),
        user=env.get("DB_USERNAME", "root"),
        password=env.get("DB_PASSWORD", ""),
        database=env.get("DB_DATABASE"),
        cursorclass=pymysql.cursors.DictCursor,
    )


def get_targets(conn, refs):
    targets = []
    with conn.cursor() as cur:
        for ref in refs:
            if ref.isdigit():
                cur.execute("SELECT id, name, email FROM users WHERE id = %s", (int(ref),))
            else:
                cur.execute("SELECT id, name, email FROM users WHERE email = %s", (ref,))
            row = cur.fetchone()
            if not row:
                sys.exit(f"No existe el usuario receptor: {ref}")
            targets.append(row)
    return targets


def get_senders(conn, exclude_ids, limit):
    placeholders = ", ".join(["%s"] * len(exclude_ids))
    with conn.cursor() as cur:
        cur.execute(
            f"SELECT id, name, email FROM users WHERE role = 'user' "
            f"AND id NOT IN ({placeholders}) ORDER BY RAND() LIMIT %s",
            (*exclude_ids, limit),
        )
        return cur.fetchall()


def xsrf(session: requests.Session) -> str:
    # El valor de la cookie viene codificado en URL; el header debe ir decodificado.
    return unquote(session.cookies.get("XSRF-TOKEN", ""))


def login(base_url: str, email: str, passwords):
    """Inicia sesión y devuelve la sesión autenticada, o None si falla."""
    session = requests.Session()
    session.headers["User-Agent"] = "chat-simulator"
    session.get(f"{base_url}/login", timeout=15)

    for password in passwords:
        r = session.post(
            f"{base_url}/login",
            data={"email": email, "password": password},
            headers={"X-XSRF-TOKEN": xsrf(session), "Referer": f"{base_url}/login"},
            allow_redirects=False,
            timeout=15,
        )
        location = r.headers.get("Location", "")
        if r.status_code in (302, 303) and not location.rstrip("/").endswith("/login"):
            return session
    return None


def send_message(session, base_url, receiver_id, content):
    r = session.post(
        f"{base_url}/chat/private/{receiver_id}",
        data={"content": content},
        headers={
            "X-XSRF-TOKEN": xsrf(session),
            "Referer": f"{base_url}/chat/private/{receiver_id}",
        },
        allow_redirects=False,
        timeout=20,
    )
    location = r.headers.get("Location", "")
    ok = r.status_code in (302, 303) and "/login" not in location
    return ok, r.status_code


def worker(sender, session, base_url, targets, count, dmin, dmax, stats):
    # Arranque escalonado para que no empiecen todos en el mismo instante
    time.sleep(random.uniform(0, dmax / 1000))

    for i in range(1, count + 1):
        target = random.choice(targets)
        content = random.choice(PHRASES)
        try:
            ok, status = send_message(session, base_url, target["id"], content)
        except requests.RequestException as e:
            ok, status = False, f"error de red: {e}"

        with print_lock:
            stats["ok" if ok else "failed"] += 1
        mark = "OK " if ok else f"FALLÓ ({status})"
        log(f"[{sender['name']} {i}/{count}] -> {target['name']}: {content}  {mark}")

        time.sleep(random.uniform(dmin, dmax) / 1000)


def main():
    parser = argparse.ArgumentParser(description="Simula usuarios enviando mensajes privados.")
    parser.add_argument("--base-url", default="http://localhost:8000", help="URL de la app")
    parser.add_argument("--env", default=".env", help="Ruta al .env de Laravel (para leer la BD)")
    parser.add_argument("--to", action="append", help="Email o ID del receptor (repetible). Por defecto colaborador@collab.com")
    parser.add_argument("--senders", type=int, default=6, help="Cantidad de usuarios que envían")
    parser.add_argument("--messages", type=int, default=40, help="Total de mensajes (se reparten entre los usuarios)")
    parser.add_argument("--delay-min", type=int, default=500, help="Pausa mínima entre mensajes de cada usuario (ms)")
    parser.add_argument("--delay-max", type=int, default=3000, help="Pausa máxima entre mensajes de cada usuario (ms)")
    parser.add_argument("--password", action="append", help="Contraseña de los emisores (repetible). Por defecto: password y password123")
    args = parser.parse_args()

    base_url = args.base_url.rstrip("/")
    dmin = max(0, args.delay_min)
    dmax = max(dmin, args.delay_max)
    passwords = args.password or ["password", "password123"]

    conn = connect_db(read_env(args.env))
    try:
        targets = get_targets(conn, args.to or ["admin@uis.edu.co"])
        senders = get_senders(conn, [t["id"] for t in targets], max(1, args.senders))
    finally:
        conn.close()

    if not senders:
        sys.exit("No hay usuarios disponibles para enviar. Ejecuta primero los seeders.")

    log("Receptores: " + ", ".join(t["email"] for t in targets))
    log("Iniciando sesión de los emisores...")

    sessions = []
    for s in senders:
        session = login(base_url, s["email"], passwords)
        if session is None:
            log(f"  - {s['name']} ({s['email']}): no se pudo iniciar sesión, se omite")
            continue
        log(f"  - {s['name']}: sesión iniciada")
        sessions.append((s, session))

    if not sessions:
        sys.exit("Ningún emisor pudo iniciar sesión. ¿Está corriendo la app en " + base_url + "?")

    # Reparto de mensajes entre los emisores
    base, extra = divmod(max(1, args.messages), len(sessions))
    stats = {"ok": 0, "failed": 0}
    threads = []
    for idx, (sender, session) in enumerate(sessions):
        count = base + (1 if idx < extra else 0)
        if count == 0:
            continue
        t = threading.Thread(
            target=worker,
            args=(sender, session, base_url, targets, count, dmin, dmax, stats),
            daemon=True,
        )
        threads.append(t)

    log(f"\nEnviando {args.messages} mensajes con {len(threads)} usuarios en paralelo. Ctrl+C para detener.\n")
    for t in threads:
        t.start()
    try:
        for t in threads:
            t.join()
    except KeyboardInterrupt:
        log("\nDetenido por el usuario.")

    log(f"\nTerminado. Enviados: {stats['ok']}  Fallidos: {stats['failed']}")


if __name__ == "__main__":
    main()
