FROM nginx:alpine

# Cloud Run requires listening on 8080 and binding 0.0.0.0
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY site/ /usr/share/nginx/html/

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
