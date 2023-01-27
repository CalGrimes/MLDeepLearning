# ReNomTAG Docker

This docker images allows you to setup and use
ReNomTAG GUI tool easily.

### Build Docker image

```shell
sh build.sh
```

### Run Docker image

```shell
sh run.sh [-d path_to_public_dir -p port]
```

You can pass following arguments.
- `-d` : Path to the public directory. This directory contains user directories, image files and label files.
- `-p` : The port number.

If no arguments are passed, directories named `public` will be created in
current directory, and the application uses `8080` port.
