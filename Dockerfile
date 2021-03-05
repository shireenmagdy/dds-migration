FROM amd64/ubuntu
RUN apt-get update && apt-get install -y gnupg2
RUN apt-get install  -y ca-certificates
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4
RUN echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-4.0.list
RUN apt-get update
RUN apt-get install -y mongodb-org-shell
RUN apt-get install -y mongodb-org-tools
RUN apt-get install -y curl
RUN apt-get install -y wget
RUN apt-get install -y zip
RUN apt-get install -y vim
RUN apt-get install -y nano
RUN apt-get install -y iputils-ping
RUN apt-get install -y telnet
RUN apt-get install -y nodejs
RUN apt-get install -y npm

RUN mkdir /deployments
WORKDIR /deployments

COPY generator.js ./
COPY index.js ./
COPY package.json ./

COPY samples/* ./samples/

ENTRYPOINT npm install
