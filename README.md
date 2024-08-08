# Theia Cloud Observability

[![Aim - Demo](https://img.shields.io/badge/Aim-Demo-cfc53c)](https://github.com/eclipsesource/.github/blob/main/repository-classification.md)

This repository contains an experimental, initial setup to monitor a Theia Cloud deployment using [Prometheus](https://prometheus.io/) and [Grafana](https://grafana.com/grafana/).

The important part of this is the configuration in folders [`kube-prometheus-stack`](./kube-prometheus-stack/) and [`grafana-dashboards`](./grafana-dashboards).

## Subfolders

- `grafana-dashboards`: JSON models of custom Grafana dashboards
- `kube-prometheus-stack`: Configuration and documentation for the Prometheus stack
- `metrics-client`: Example Typescript app to process Prometheus metrics via HTTP REST API

## Setup

1. If not already done: Setup Theia Cloud  on your Kubernetes cluster. See the [official documentation](https://theia-cloud.io/documentation/setuptheiacloud/).
2. Install the Prometheus stack by following the subfolder's [README](./kube-prometheus-stack/README.md)
3. Especially if you expose Grafana publicly, make sure to change the admin password ASAP.

## Grafana

If you exposed Prometheus via an Ingress, access the web ui via the configured domain.
Otherwise, you can use `kubectl` to expose it at <http://localhost:3333>.

```sh
kubectl port-forward svc/kube-prometheus-stack-grafana 3333:80 -n kube-prometheus-stack
```

The default admin account credentials are `admin:prom-operator`.
Except if you configured another admin password in the values.

To find the pre-defined Theia Cloud dashboard containing metrics on cluster, node, pod and Theia backend level, click on `Dashboards` in the menu on the left.
Scroll down or search to find the `Theia Cloud` dashboard.

## Try Prometheus queries directly

If you exposed Prometheus via an Ingress, access the web ui via the configured domain.
Otherwise, you can use `kubectl` to expose it at <http://localhost:9090>.

```sh
kubectl port-forward svc/kube-prometheus-stack-prometheus 9090:9090 -n kube-prometheus-stack
```

Besides using the Web UI, metrics can also be queries via a REST API.
See the [Prometheus docs](https://prometheus.io/docs/prometheus/latest/querying/api/) on this and check the minimal example in the [metrics-client](./metrics-client/) folder.

### Prometheus queries

This section lists [PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/) queries for Prometheus to get metrics for CPU and RAM on a cluster, node, pod, and Theia level.

Note that some of the queries assume that Theia Cloud was installed in namespace `theiacloud`.
If this is not the case, the corresponding selector `{namespace="theiacloud"}` needs to be adapted in the queries.

#### Cluster

Metrics for the whole cluster.

```
# CPU: Ratio of used cpus to total cpus available in the cluster
cluster:node_cpu:ratio

# CPU: Number of CPUs used in the cluster. Using 1 cpu does not mean that exactly one (virtual) core was fully used but that the equivalent was used - even if actually distributed about different cores.
# Calculated based on the increase of total cpu time in the last 5 minutes
cluster:node_cpu:sum_rate5m

# Memory: Calculates the ratio of used memory across all nodes
1 - sum(node_memory_MemAvailable_bytes) / sum(node_memory_MemTotal_bytes)

# Memory: The total amount of memory across all nodes
sum(node_memory_MemTotal_bytes)

# Memory: The used memory across all nodes
sum(node_memory_MemTotal_bytes) - sum(node_memory_MemAvailable_bytes)
```

#### Node

Metrics collected per node of the cluster.

```
# CPU: Usage ratio per node
instance:node_cpu:ratio

# CPU: Usage in virtual CPUs per node
instance:node_cpu:rate:sum

# Memory: Usage per node
node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes

# Memory: Usage ratio per node
1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes
```

#### Pod

Metrics per (session) pod. This means the whole pod, not only the Theia container in the pod. For many applications this will be nearly identical to the metrics for the Theia container only.
However, for applications using sidecar containers besides the Theia container, this provides information considering these, too.

```
# Memory used by pods in the theiacloud namespace. Could filter further to only get session pods.
# Filter out empty container time series because this leads to duplicate results.
# Make sure to only read the metrics as exposed by the kubelet by specifying the job and metrics_path labels accordingly
sum(container_memory_usage_bytes{container!="POD",container!="", job="kubelet", metrics_path="/metrics/cadvisor",namespace="theiacloud"}) by (pod)

# CPU used by pods in the theiacloud namespace. Could filter further to only get session pods
# Filter job and metrics_path as for memory (same as for memory)
sum(rate(container_cpu_usage_seconds_total{container!="POD",container!="", job="kubelet", metrics_path="/metrics/cadvisor", namespace="theiacloud"}[5m])) by (pod)

# Number of running session pods
count(up{job="kube-prometheus-stack/theiacloud-sessions"})
```

#### Theia Backend

Metrics for the Theia application container based on metrics directly exposed by Theia's metrics extension.
This requires the `@theia/metrics` extension to be installed in the application.
This is the case for Theia IDE and the Theia Cloud example application.

```
# CPU used by the process. Might need further filtering if there are additional services in the Theia Cloud namespace. A value of 1 means the process uses 1 vCPU.
rate(process_cpu_seconds_total{namespace="theiacloud"}[1m])

# Virtual memory consumed by the process. This includes all memory including swapped out memory and, thus, indicates the total memory consumption of the process
process_virtual_memory_bytes{namespace=”theiacloud”, job="kube-prometheus-stack/theiacloud-sessions"}

# Process start time
# Stop time cannot be exposed as a metric. It can be determined by checking when this or another timeline for the session ends.
process_start_time_seconds{namespace="theiacloud"}
```

## Repository Classification

This repository contains a demonstrator. It is used to demonstrate a specific feature on a documented demo path. It is not meant to be used in production or as a template. Consequently, the authors do not actively ensure that anything other than the demo path works and don’t plan to support different set-ups or environments. Until stated otherwise, the authors do not intend to apply security fixes, update dependencies, fix issues or provide more documentation. Please feel free to browse the code although it is not meant as a blueprint, i.e. there might be expected and undocumented architectural shortcomings or work around.
Please feel free to report issues, ask questions and raise discussions, but please don’t expect the authors to provide support.

If you are interested in transforming this demonstrator into an adoptable state, please get in contact with us using the [discussions forum](https://github.com/eclipsesource/theia-cloud-observability/discussions) and have a look at our [support options](https://eclipsesource.com/services)!
