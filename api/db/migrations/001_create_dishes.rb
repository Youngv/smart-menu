Sequel.migration do
  up do
    create_table(:dishes) do
      primary_key :id
      String :name, null: false
      String :description, text: true
      String :dish_type, null: false
      DateTime :created_at
      DateTime :updated_at
      index [:name, :dish_type], unique: true
    end
  end

  down do
    drop_table(:dishes)
  end
end 
