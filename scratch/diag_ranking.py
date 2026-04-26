import pandas as pd
from sqlalchemy import text
from core.database import engine

def diagnostic():
    try:
        conn = engine.connect()
        
        where_sql = '1=1'
        params = {}
        limit = 20
        offset = 0
        sort_by = 'xg_shot'
        
        print(f"--- Diagnosing Ranking Table ---")
        print(f"Params: limit={limit}, offset={offset}, sort_by={sort_by}")
        
        # Test Count
        count_query = text(f"SELECT COUNT(DISTINCT id) FROM wyscout_data.players_enriched WHERE {where_sql}")
        total_count = conn.execute(count_query, params).scalar()
        print(f"Total Count: {total_count}")
        
        # Test Data Fetch
        query = text(f"""
            SELECT * FROM (
                SELECT *, 
                       ROW_NUMBER() OVER(PARTITION BY id ORDER BY season DESC, minutes_on_field DESC) as rn
                FROM wyscout_data.players_enriched
                WHERE {where_sql}
            ) t
            WHERE rn = 1
            ORDER BY "{sort_by}" DESC
            LIMIT :limit OFFSET :offset
        """)
        
        df = pd.read_sql(query, conn, params={**params, "limit": limit, "offset": offset})
        print(f"Rows returned: {len(df)}")
        
        if not df.empty:
            print("First 5 rows:")
            print(df[['name', 'season', 'competition', 'xg_shot']].head())
        else:
            print("WARNING: DataFrame is empty for page 1!")
            
    except Exception as e:
        print(f"ERROR: {str(e)}")
    finally:
        conn.close()

if __name__ == "__main__":
    diagnostic()
