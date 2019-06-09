FROM nginx
# Want to copy our default.conf file on top of the one already there
COPY ./default.conf /etc/nginx/conf.d/default.conf
# The default.conf file for dev has a sockejs-node route that in prod is
# not needed but for this we'll leave it.