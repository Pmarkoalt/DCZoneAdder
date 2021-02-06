ECR_URL=971955089791.dkr.ecr.us-east-1.amazonaws.com
EC2_URL=ec2-54-221-66-79.compute-1.amazonaws.com

ecr-login:
	aws ecr get-login-password --region us-east-1 --profile cbdevllc | docker login --username AWS --password-stdin $(ECR_URL)

deploy:
	docker build -t zone-builder:latest .
	docker tag zone-builder:latest $(ECR_URL)/zone-builder:latest
	docker push $(ECR_URL)/zone-builder:latest

ssh:
	sudo ssh -i ~/.ssh/property-apps.pem ubuntu@$(EC2_URL)

deploy-ec2:
	sudo scp -r -i ~/.ssh/property-apps.pem ./**/* ubuntu@$(EC2_URL):~/apps/zone-builder
