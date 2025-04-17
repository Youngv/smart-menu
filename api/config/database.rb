require 'sequel'

# 获取项目根目录
ROOT_DIR = File.expand_path('../..', __dir__)

# 确保使用完整路径连接到数据库
DB = Sequel.connect("sqlite://#{File.join(ROOT_DIR, 'api/db/dishes.db')}")

# 启用外键约束
DB.extension(:connection_validator)
DB.pool.connection_validation_timeout = -1
