require 'roda'
require 'rack/cors'
require_relative 'api/config/database'
require_relative 'api/models/dish'
require_relative 'api/routes/dishes'

class MenuApp < Roda
  plugin :json
  plugin :hooks
  plugin :public
  plugin :not_found
  plugin :default_headers, {
    'Content-Type' => 'application/json',
    'Cache-Control' => 'no-store'
  }

  use Rack::Cors do
    allow do
      origins '*'
      resource '*', headers: :any, methods: [:get, :post, :put, :delete, :options]
    end
  end

  # 设置静态文件目录为项目根目录
  opts[:root] = File.expand_path('.', __dir__)

  route do |r|
    # 提供静态文件服务
    r.public

    r.root do
      # 根路径返回 index.html
      response['Content-Type'] = 'text/html'
      File.read(File.join(opts[:root], 'public', 'index.html'))
    end

    # API 路由
    r.on 'api' do
      response['Content-Type'] = 'application/json'
      
      # 菜品 API
      r.on 'dishes' do
        r.run DishesApi
      end
    end

    # 所有其他路由，用于 SPA 路由处理
    r.get do
      # 对于任何其他 GET 请求，返回 index.html 以支持前端路由
      response['Content-Type'] = 'text/html'
      File.read(File.join(opts[:root], 'index.html'))
    end
  end
end

# 如果直接运行此文件，启动开发服务器
if __FILE__ == $PROGRAM_NAME
  require 'rack/handler/puma'
  puts "启动服务器在 http://localhost:3000"
  Rack::Handler::Puma.run MenuApp.freeze.app, Port: 3000
end 
