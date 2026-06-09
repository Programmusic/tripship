resource "docker_volume" "uploads" {
  name = var.uploads_volume
}

output "volume_name" {
  value = docker_volume.uploads.name
}
