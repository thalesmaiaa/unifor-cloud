def test_create_task(client, auth_headers):
    # First create a project
    proj = client.post("/api/projects/", json={"name": "Task Project"}, headers=auth_headers)
    project_id = proj.json()["id"]

    response = client.post("/api/tasks/", json={
        "title": "Test Task",
        "description": "A test task",
        "project_id": project_id,
    }, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Task"
    assert data["status"] == "todo"
    assert data["priority"] == "medium"


def test_list_tasks(client, auth_headers):
    proj = client.post("/api/projects/", json={"name": "Task Project"}, headers=auth_headers)
    project_id = proj.json()["id"]

    client.post("/api/tasks/", json={"title": "Task 1", "project_id": project_id}, headers=auth_headers)
    client.post("/api/tasks/", json={"title": "Task 2", "project_id": project_id}, headers=auth_headers)

    response = client.get(f"/api/tasks/?project_id={project_id}", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_update_task(client, auth_headers):
    proj = client.post("/api/projects/", json={"name": "Task Project"}, headers=auth_headers)
    project_id = proj.json()["id"]

    task = client.post("/api/tasks/", json={"title": "Old Title", "project_id": project_id}, headers=auth_headers)
    task_id = task.json()["id"]

    response = client.put(f"/api/tasks/{task_id}", json={
        "title": "New Title",
        "status": "in_progress",
        "priority": "high",
    }, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "New Title"
    assert data["status"] == "in_progress"
    assert data["priority"] == "high"


def test_delete_task(client, auth_headers):
    proj = client.post("/api/projects/", json={"name": "Task Project"}, headers=auth_headers)
    project_id = proj.json()["id"]

    task = client.post("/api/tasks/", json={"title": "Delete Me", "project_id": project_id}, headers=auth_headers)
    task_id = task.json()["id"]

    response = client.delete(f"/api/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 204

    response = client.get(f"/api/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 404


def test_task_requires_project_id(client, auth_headers):
    response = client.get("/api/tasks/", headers=auth_headers)
    assert response.status_code == 422


def test_task_not_found(client, auth_headers):
    response = client.get("/api/tasks/99999", headers=auth_headers)
    assert response.status_code == 404
