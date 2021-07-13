---
title: How Production Kubernetes works
date: 2021-07-10T06:20:18.198Z
tags: 
  - "docker"
  - "k8s"
  - "AWS"
category: devops
description:
---

Using a Declarative approach: When updating a config file, Kubernetes's Masters will look at the config file. If it sees a same name and identical kind, it will try to use the updated config and apply it to the existing object.

### Get info about an object

```bash
# kubectl describe <object kind> <object name>
kubectl describe pod server-deployment-587d9df98f-825dp
```

### Deployment

deployment is used to manage pods.

To remove an object, use

```yaml
# Specify the path of the config file.
kubectl delete -f <config file>
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: spj-api
  namespace: elastic-stack
  labels:
    app: spj-api
spec:
	# How many pods you want to run
  replicas: 2
  selector:
		# master use this to track the below labels, you can have multiple pods
		# but only want to r¥handle one of them.
    matchLabels:
      component: web
  template:
		# define the label
    metadata:
      labels:
        app: web
    spec:
      containers:
	      - name: client
	        image: st/multi-client
	        ports:
		        - containerPort: 3000
```

Every single pod we create has its own IP address, and it is internal to the VM. If it restarts or we make multiple instance of the pod, it might get an entirely new IP, so if we connect the pod directly, we might have to change the port every time.

By using service, it will automatically connect the pods for us.

When you update deployment, it will create a new pod for us.

## Get deployment to recreate image using latest image build

- Why is challenging?

If there is no change in the config file, `kubectl` will just reject the file.

First, you could append version number to the config file (Fails in CI).

Second, you could use an imperative command to manually update the yaml.

```yaml
# kubectl set image <object kind>/<object_name> <container_name>=<new image to use>
kubectl set image deployment/client-deployment client=st/multi-client:v5
```

### Configure the VM to use your docker server (Use VM's docker server)

`eval $(minikube docker-env)` this only applies to your current terminal window.

## ClusterIP Service

It is use for communication between pods inside the Node, and it is not accessible to the out side world.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres-cluster-ip-service
spec:
  type: ClusterIP
  selector:
		# key pair value you defined in the deployment yaml
    component: postgres
  ports:
  - port: 5432
    targetPort: 5432
```

## LoadBalancer

Legacy way of getting network traffic into a cluster. Load balancer only allows you to access one set of pods.

## Ingress Service

Use to handle traffic from outside. Expose a set of services to the outside world.

**ingress-nginx**: community led project

github.com/kubernetes/ingress-nginx

**~~kubernetes-ingress (NOT USING)**: a project led by company nginx~~

ingress-nginx setup changes depending on your environment.

Ingress Config(we defined) → Ingress Controller(kubectl made) → something that accepts incoming traffic

### Local:

### GC:

### PVC (Persistent Volume Claim)

What is volume, Container has a filesystem just for the container itself. If a Pod crash, if we don't claim a persistent volume, all the data will be lost.

When we set a PVC for the pod, the pod will think it is writing to its own container's filesystem but in reality, it is writing to a host machine outside the Pod. 

**NEVER** just increase the replicas of the pods to scale the database, it will make the two pods not recognizing each other and cause conflicts.

`Volume` in container terminology

- allows a container to access a filesystem outside itself

`Volume` in Kubernetes terminology

- An **object** that allows a container to store data at the pod level

### Three types of volume in Kubernetes

**Volumes**: which exists inside the pod and gets destroy or create with the pod.

**Persistent Volume Claim**: What the container will be using when the pod is created.

**Persistent Volume**: Predefine storage objects that indicates how many storage options it has.

- Statically provisioned PV (created ahead of time)
- Dynamically provisioned PV (created on the fly)

Give a PVC to Kubernetes, then Kubernetes will try to find a resources that has this amount.

**Access Modes**:

- ReadWriteOnce: Can be used by a single node.
- ReadOnlyMany: Multiple nodes can read from this
- ReadWriteMany: Can be read and written to by many nodes

You should first allocate volumes inside your template in order to use the storage you define in PVC.

```yaml
template:
	...
  spec:
    volumes:
      - name: postgres-storate
        persistentVolumeClaim:
          claimName: database-persistent-volume-claim
```

You should also assign the volume inside the containers as well.

```yaml
containers:
  - name: postgres
    image: postgres
    volumeMounts:
      - name: postgres-storate
        mountPath: /var/lib/postgresql/data
				# Creates a folder inside your PVC, only required in postgresql
        subPath: postgres
```

## Cloud Storage Config

Options for different storage provider has its own config.

**storageClassName**

```yaml
# How many you can get
kubectl get pvc
# Actual volume exist inside VM or NFS
kubectl get pv
```

### Environments Variable

```yaml
env:
	- name: <nameofthe env>
		value: <value of env>
```

```yaml
kubectl create secret generic <secret_name> --from-literal <key>=<value>
```

Remember, env should be provide as string.