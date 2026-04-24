import sys
import os
sys.path.append(os.getcwd())

from core.database import engine
from sqlalchemy import text

def test_unaccent():
    try:
        with engine.connect() as conn:
            # Tester si unaccent existe
            res = conn.execute(text("SELECT unaccent('eae')")).scalar()
            print(f"Unaccent test success: {res}")
    except Exception as e:
        print(f"DB Error: {repr(e)}")

if __name__ == "__main__":
    test_unaccent()
