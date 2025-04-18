require 'json'
require_relative '../models/dish'

def seed_database
  # 清空现有数据
  Dish.dataset.delete

  # 读取 dishes.json 文件
  json_file = File.join(File.dirname(__FILE__), '../../public/dishes.json')
  dishes_data = JSON.parse(File.read(json_file))

  # 导入荤菜
  dishes_data['meat'].each do |dish|
    Dish.create(
      name: dish['name'],
      description: dish['description'],
      type: 'meat',
      created_at: Time.now,
      updated_at: Time.now
    )
  end

  # 导入素菜
  dishes_data['vegetarian'].each do |dish|
    Dish.create(
      name: dish['name'],
      description: dish['description'],
      type: 'vegetarian',
      created_at: Time.now,
      updated_at: Time.now
    )
  end

  # 导入汤类
  dishes_data['soup'].each do |dish|
    Dish.create(
      name: dish['name'],
      description: dish['description'],
      type: 'soup',
      created_at: Time.now,
      updated_at: Time.now
    )
  end

  puts "成功导入 #{Dish.count} 道菜品"
end

# 执行种子数据导入
seed_database if $PROGRAM_NAME == __FILE__
