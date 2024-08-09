# Prometheus and Grafana Deployment

This folder contains configuration and installation instructions to install Prometheus and Grafana as part of [kube-prometheus](https://github.com/prometheus-operator/kube-prometheus) via the [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/blob/main/charts/kube-prometheus-stack/README.md) Helm chart.

Furthermore, it contains additional Kubernetes manifests to apply in folder `manifests`

## Pre Install

### Values Configuration

Check the [values.yaml](./values.yaml) file and verify the configuration.
You can find all default values of the kube-prometheus-stack [here](https://github.com/prometheus-community/helm-charts/blob/bc0959503f375cade19ccaa65b609133814a9861/charts/kube-prometheus-stack/values.yaml).

#### Storage

Pay special attention to the storage configuration, especially the `storageClassName` values.
This might need to be adapted depending on available [storage classes](https://kubernetes.io/docs/concepts/storage/storage-classes/) on the cluster.
Get available storage classes with:

```sh
kubectl get storageclass
```

Also consider the storage size. You might want to use more than the pre-configured 10GB.

#### Ingress

With the default configuration, neither Prometheus nor Grafana are exposed outside the cluster.
This means the API respectively Web UI cannot be accessed without [port forwarding using kubectl](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_port-forward/).

The [values.yaml](./values.yaml) file in this folder only contains the default values
because required configuration differs based on the used ingress provider (e.g. NGinX) and
further properties of the cluster (i.e. domain, TLS certificate handling).

Also note that the Prometheus API and Web UI do not require any credentials and, thus,
can be queried by anyone when this is exposed publicly.

### Theia Cloud Installation

The [additional manifests](./manifests/) assume that Theia Cloud is installed in namespace `theiacloud`.
If this is not the case, manifest [pod-selector-theia-cloud-sessions.yaml](./manifests/pod-selector-theia-cloud-sessions.yaml) needs adaption.
In the `namespaceSelector`, replace `theiacloud` with your installation namespace.

### Kube Prometheus Stack Prerequisites

Using GKE, no additional configuration for the cluster was needed for the stack to work out of the box.
Nevertheless, briefly check the prerequisites of [kube-prometheus](https://github.com/prometheus-operator/kube-prometheus/blob/main/README.md#prerequisites).

### Kubectl and Helm

The tools [kubectl](https://kubernetes.io/docs/reference/kubectl/) and [Helm](https://helm.sh/docs) are required to execute the installation.
Kubectl needs to be configured to point to the desired Kubernetes cluster.

## Install Helm Chart

```sh
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# With Grafana admin password from values file or default
helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
--version 60.2.0 --namespace kube-prometheus-stack --create-namespace \
--values values.yaml

# With custom Grafana admin password only provided at install time
# Replace PASSWORD with your custom password.
helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
--version 60.2.0 --namespace kube-prometheus-stack --create-namespace \
--values values.yaml
--set grafana.adminPassword=PASSWORD
```

## Upgrade Helm Chart

```sh
helm upgrade kube-prometheus-stack prometheus-community/kube-prometheus-stack \
--version 60.2.0 --namespace kube-prometheus-stack \
--values values.yaml
```

## Install/Upgrade additional manifests

**Note:** The custom Grafana dashboard [dashboard-theiacloud.yaml](./manifests/dashboard-theiacloud.yaml) assumes that Theia Cloud was installed in namespace `theiacloud`.
If this is not the case for you installation, you can search the file for `namespace=\"theiacloud\"` and replace `theiacloud` with your namespace in there.

```sh
kubectl apply -f manifests
```
