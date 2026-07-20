from src.postgres_db import query
from src.custom_types import (
    DatabaseUser,
    DatabaseWorkspace,
    DatabaseFileUpload,
)
import logging

logger = logging.getLogger()


class DatabaseService:
    async def authenticate(self) -> bool:
        try:
            query(
                "SELECT 1+1;",
            )
            return True
        except Exception as e:
            print(f"Error authenticating database: {e}")
            return False

    def insert_user(self, email: str, collection_name: str) -> bool:
        try:
            query(
                "INSERT INTO users (email, collection_name) VALUES (%s, %s)",
                (email, collection_name),
            )

            created_user = self.find_user(email, None)
            self.create_workspace("default", "default workspace", created_user.id)
            return True
        except Exception as e:
            print(f"Error inserting user: {e}")
            return False

    def find_user(self, email: str, user_id: int | None) -> DatabaseUser:
        try:
            user = (
                query(
                    "SELECT * FROM users WHERE email=%s LIMIT 1;",
                    (email,),
                )
                if user_id is None
                else query(
                    "SELECT * FROM users WHERE id=%s LIMIT 1;",
                    (user_id,),
                )
            )
            if len(user):
                id, email, collection_name, add_date = user[0]
                workspace_list = self.find_workspaces(id)

                return DatabaseUser(
                    email=email,
                    id=id,
                    collection_name=collection_name,
                    workspaces=workspace_list,
                    add_date=add_date,
                )
            return None
        except Exception as e:
            print(f"Error getting user: {e}")
            return None

    def create_workspace(self, name, description, user_id, tags=""):
        query(
            "INSERT INTO workspaces (name, user_id, description, tags) VALUES (%s, %s, %s, %s)",
            (name, user_id, description, tags),
        )

    def find_workspaces(self, find_id: str) -> list[DatabaseWorkspace]:
        workspaces = query(
            "SELECT * FROM workspaces WHERE user_id=%s;",
            (find_id,),
        )
        workspace_list = []

        for id, user_id, name, tags, description in workspaces:
            workspace_list.append(
                DatabaseWorkspace(
                    id=id,
                    user_id=user_id,
                    name=name,
                    tags=tags,
                    description=description,
                )
            )
        return workspace_list

    def create_file_upload(
        self,
        file_key: str,
        user_id: int,
        workspace_id: int,
        file_name: str,
        file_path: str,
    ) -> bool:
        try:
            query(
                """
                INSERT INTO file_uploads
                (user_id, workspace_id, file_name, file_path, file_key)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (user_id, workspace_id, file_name, file_path, file_key),
            )
            return True
        except Exception as e:
            logger.exception("Failed to insert file upload")
            return False

    def find_files(
        self,
        user_id: int,
        workspace_id: int,
    ) -> list[DatabaseFileUpload]:
        try:
            files = query(
                """
                SELECT *
                FROM file_uploads
                WHERE user_id=%s
                AND workspace_id=%s
                ORDER BY uploaded_at DESC
                """,
                (user_id, workspace_id),
            )

            file_list = []

            for (
                file_id,
                user_id,
                workspace_id,
                file_name,
                file_path,
                _,
                uploaded_at,
            ) in files:
                file_list.append(
                    DatabaseFileUpload(
                        id=file_id,
                        user_id=user_id,
                        workspace_id=workspace_id,
                        file_name=file_name,
                        file_path=file_path,
                        uploaded_at=uploaded_at,
                    )
                )

            return file_list

        except Exception as e:
            print(f"Error getting files: {e}")
            return []
