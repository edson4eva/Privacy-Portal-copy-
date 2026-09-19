FROM nginx:alpine

# The base image's entrypoint runs a script that adds an IPv6 listener to the
# default config, and it calls `apk manifest nginx` to do so - which needs
# Alpine's package repositories. Where there is no outbound network that call
# hangs and nginx never starts. Our config declares `listen [::]:8080` itself,
# so the script has nothing to do for us.
RUN rm -f /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh

# Cloud Run requires listening on 8080 and binding 0.0.0.0
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY site/ /usr/share/nginx/html/

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
