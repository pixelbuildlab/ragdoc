import psycopg
import logging
import time
import traceback

logger = logging.getLogger(__name__)


def get_connection():
    return psycopg.connect(
        host="db",
        port=5432,
        dbname="rag_bot",
        user="postgres",
        password="postgres",
    )


def query(sql, params=None):
    start_time = time.time()

    try:
        logger.info("Running SQL query")
        logger.info("SQL: %s", sql.strip())
        logger.info("Params: %s", params)

        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, params)

                execution_time = round(time.time() - start_time, 4)

                if cur.description:
                    result = cur.fetchall()

                    logger.info(
                        "Query executed successfully in %ss | Rows: %s",
                        execution_time,
                        len(result),
                    )

                    conn.commit()
                    return result

                conn.commit()

                logger.info(
                    "Query executed successfully in %ss",
                    execution_time,
                )

                return None

    except Exception as e:
        execution_time = round(time.time() - start_time, 4)

        logger.error("Database query failed after %ss", execution_time)
        logger.error("SQL: %s", sql.strip())
        logger.error("Params: %s", params)
        logger.error("Error: %s", e)
        logger.error(traceback.format_exc())

        raise
