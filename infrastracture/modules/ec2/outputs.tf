output "ubuntu_ami" {
  value = data.aws_ami.ubuntu
}
output "instance-arn" {
  value = aws_instance.server.arn
}
output "instance-id" {
  value = aws_instance.server.arn
}
output "id" {
  value = aws_instance.server.id
}