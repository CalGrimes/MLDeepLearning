FROM ubuntu:16.04

# update apt info & install packages
RUN apt-get update && \
    apt-get install -y \
    git \
    curl \
    python3 \
    python3-tk \
    build-essential \
    python3-pip \
    python3-venv \
    nodejs \
    npm \
    sqlite3 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# install pip packages
RUN pip3 install jupyter

# install n
RUN npm install -g n

# install node stabled version
RUN n stable

# git clone ReNom Apps
RUN git clone https://github.com/ReNom-dev-team/ReNomTAG.git && cd ReNomTAG && pip3 install -r requirements.txt && pip3 install -e . && cd js && npm install && npm run build

# mkdir data folders
RUN mkdir /var/public

CMD bash -c "cd /var/ && python3 -m renom_tag --port 8080"
