# edge

## Quick run

such as demo


### Run edge1

- local
```bash
DEVICE_ID=edge1 MQTT_LOCAL_POST=1883 MQTT_CLOUD_PORT=1884 npm run start:dev
```

- from devcontainer
```bash
DEVICE_ID=edge1 MQTT_LOCAL_HOST=broker_local MQTT_CLOUD_HOST=broker_cloud npm run start:dev
```


### Run edge2

- local
```bash
DEVICE_ID=edge2 MQTT_LOCAL_PORT=1884 MQTT_CLOUD_PORT=1885 npm run start:dev
```

- from devcontainer
```bash
DEVICE_ID=edge2 MQTT_LOCAL_HOST=broker_cloud MQTT_CLOUD_HOST=broker_cloud2 npm run start:dev
```

### Run cloud

- local
```bash
DEVICE_ID=cloud DEVICE_CLOUD=true MQTT_CLOUD_PORT=1885 npm run start:dev
```

- from devcontainer
```bash
DEVICE_ID=cloud DEVICE_CLOUD=true MQTT_CLOUD_HOST=broker_cloud2 npm run start:dev
```

