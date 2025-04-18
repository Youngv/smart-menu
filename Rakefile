desc '设置数据库结构'
task :db_setup do
  ruby 'api/db/setup.rb'
end

desc '向数据库导入种子数据'
task :db_seed do
  ruby 'api/db/seed.rb'
end

desc '启动开发服务器'
task :server do
  ruby 'app.rb'
end

desc '运行完整的数据库设置和种子数据导入'
task :setup => [:db_setup, :db_seed]

task :default => :server
