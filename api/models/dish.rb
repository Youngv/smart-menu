require_relative '../config/database'

class Dish < Sequel::Model
  # 验证字段存在
  plugin :validation_helpers
  def validate
    super
    validates_presence [:name, :type, :description]
    validates_includes %w[meat vegetarian soup], :type
  end
end 
