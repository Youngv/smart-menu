FROM ruby:3.2

# 安装nginx和其他必要软件
RUN apt-get update && apt-get install -y \
    nginx \
    build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 安装Ruby依赖
ADD Gemfile /app/Gemfile
ADD Gemfile.lock /app/Gemfile.lock
RUN bundle install --jobs 4

# 复制应用程序文件
COPY . /app/

# 删除默认的Nginx站点配置
RUN rm /etc/nginx/sites-enabled/default

# nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 创建启动脚本
RUN echo '#!/bin/bash\n\
nginx -g "daemon off;" &\n\
bundle exec rake server\n\
' > /app/start.sh && chmod +x /app/start.sh

# 设置启动命令
CMD ["/app/start.sh"]
