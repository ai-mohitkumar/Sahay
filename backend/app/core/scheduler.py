import threading
import time
from datetime import datetime, date
from typing import List
from app.db.session import SessionLocal
from app.models.user import User
from app.models.email_log import EmailPreference
from app.services.email_engine import EmailEngine

class SahayBackgroundScheduler:
    def __init__(self):
        self._running = False
        self._thread = None

    def start(self):
        if self._running:
            return
        self._running = True
        self._thread = threading.Thread(target=self._run_loop, daemon=True)
        self._thread.start()
        print("[Scheduler] Sahay Background Dispatch Scheduler active (handling weekly reports and morning digests)...")

    def stop(self):
        self._running = False

    def _run_loop(self):
        last_checked_minute = -1
        while self._running:
            try:
                now = datetime.now()
                if now.minute != last_checked_minute:
                    last_checked_minute = now.minute
                    self._check_and_dispatch(now)
            except Exception as e:
                print(f"Error in scheduler tick: {e}")
            time.sleep(30)

    def _check_and_dispatch(self, now: datetime):
        """
        Dispatches daily morning digests and Sunday evening State-of-You reports.
        """
        current_time_str = now.strftime("%H:%M")
        is_sunday_evening = now.weekday() == 6 and now.hour == 20 and now.minute == 0

        db = SessionLocal()
        try:
            users = db.query(User).all()
            for user in users:
                pref = db.query(EmailPreference).filter(EmailPreference.user_id == user.id).first()
                if not pref:
                    continue

                # 1. Daily morning digest check
                if pref.daily_digest and pref.send_time == current_time_str:
                    try:
                        EmailEngine.send_daily_digest(db, user.id)
                    except Exception as e:
                        print(f"Failed to dispatch scheduled daily digest for user #{user.id}: {e}")

                # 2. Weekly Sunday report check
                if pref.weekly_report and is_sunday_evening:
                    try:
                        EmailEngine.send_weekly_report(db, user.id)
                    except Exception as e:
                        print(f"Failed to dispatch scheduled weekly report for user #{user.id}: {e}")
        finally:
            db.close()

background_scheduler = SahayBackgroundScheduler()
