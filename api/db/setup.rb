require 'sequel'
require 'fileutils'
require 'sequel/extensions/migration'

# 获取项目根目录和数据库目录
ROOT_DIR = File.expand_path('../..', __dir__)
DB_DIR = File.join(ROOT_DIR, 'api/db')
MIGRATIONS_DIR = File.join(DB_DIR, 'migrations')

# 确保数据库目录存在
FileUtils.mkdir_p(DB_DIR)

# 连接数据库
DB = Sequel.connect("sqlite://#{File.join(DB_DIR, 'dishes.db')}")

# 运行迁移
Sequel::Migrator.run(DB, MIGRATIONS_DIR)

puts "数据库表已创建成功"
