resource "docker_image" "postgres" {
  name = "postgres:16-alpine"
}

resource "docker_container" "postgres" {
  name  = var.container_name
  image = docker_image.postgres.image_id

  env = [
    "POSTGRES_DB=${var.db_name}",
    "POSTGRES_USER=${var.db_user}",
    "POSTGRES_PASSWORD=${var.db_password}",
  ]

  ports {
    internal = 5432
    external = 5432
  }

  networks_advanced {
    name = var.network_name
  }

  volumes {
    volume_name    = docker_volume.pgdata.name
    container_path = "/var/lib/postgresql/data"
  }

  restart = "unless-stopped"
}

resource "docker_volume" "pgdata" {
  name = "${var.container_name}-data"
}

output "connection_url" {
  value     = "postgresql://${var.db_user}:${var.db_password}@${var.container_name}:5432/${var.db_name}"
  sensitive = true
}
