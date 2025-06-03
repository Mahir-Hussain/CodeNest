from fastapi import FastAPI


class routes:
    def __init__(self):
        self.app = FastAPI()

    def run(self):
        @self.app.get("/")
        def read_root():
            return {"message": "Welcome to the Code Snippets API"}

        @self.app.get("/snippets")
        def get_snippets():
            return {"snippets": []}

        @self.app.post("/snippets")
        def create_snippet(snippet: dict):
            return {"message": "Snippet created successfully", "snippet": snippet}

        @self.app.delete("/snippets/{snippet_id}")
        def delete_snippet(snippet_id: int):
            return {"message": f"Snippet {snippet_id} deleted successfully"}

        return self.app


api_instance = routes()
app = api_instance.run()
