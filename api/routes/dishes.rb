class DishesApi < Roda
  plugin :json
  plugin :json_parser
  plugin :all_verbs
  plugin :halt
  plugin :path_matchers

  route do |r|
    # GET /api/dishes - 获取所有菜品
    r.is do
      r.get do
        result = {}
        %w[meat vegetarian soup].each do |type|
          result[type] = Dish.where(dish_type: type).map do |dish|
            { id: dish.id, name: dish.name, description: dish.description }
          end
        end
        result
      end

      # POST /api/dishes - 创建新菜品
      r.post do
        data = r.params
        
        # 验证必填字段
        required = %w[name description dish_type]
        missing = required.select { |field| data[field].to_s.empty? }
        r.halt(400, { error: "缺少字段：#{missing.join(', ')}" }) unless missing.empty?
        
        # 验证菜品类型
        valid_types = %w[meat vegetarian soup]
        r.halt(400, { error: "无效菜品类型，有效类型：#{valid_types.join(', ')}" }) unless valid_types.include?(data['dish_type'])
        
        # 检查菜品是否已存在
        existing = Dish.where(name: data['name'], dish_type: data['dish_type']).first
        r.halt(409, { error: '菜品已存在' }) if existing
        
        # 创建新菜品
        dish = Dish.create(
          name: data['name'],
          description: data['description'],
          dish_type: data['dish_type'],
          created_at: Time.now,
          updated_at: Time.now
        )
        
        { id: dish.id, name: dish.name, description: dish.description, dish_type: dish.dish_type }
      end
    end

    # 处理 ID 路由 /api/dishes/:id
    r.on Integer do |id|
      dish = Dish[id]
      r.halt(404, { error: '菜品不存在' }) unless dish

      # GET /api/dishes/:id - 获取单个菜品
      r.get do
        { id: dish.id, name: dish.name, description: dish.description, dish_type: dish.dish_type }
      end

      # PUT /api/dishes/:id - 更新菜品
      r.put do
        data = r.params
        
        # 更新字段
        dish.name = data['name'] if data['name']
        dish.description = data['description'] if data['description']
        dish.dish_type = data['dish_type'] if data['dish_type'] && %w[meat vegetarian soup].include?(data['dish_type'])
        dish.updated_at = Time.now
        
        # 保存更新
        dish.save
        
        { id: dish.id, name: dish.name, description: dish.description, dish_type: dish.dish_type }
      end

      # DELETE /api/dishes/:id - 删除菜品
      r.delete do
        # 删除菜品
        dish.delete
        
        { success: true, message: '菜品已删除' }
      end
    end
  end
end 
