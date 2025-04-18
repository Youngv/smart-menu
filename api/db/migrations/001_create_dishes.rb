Sequel.migration do
  up do
    create_table(:dishes) do
      primary_key :id
      String :name, null: false
      String :description, text: true
      String :type, null: false
      DateTime :created_at
      DateTime :updated_at
      index [:name, :type], unique: true
    end
  end

  down do
    drop_table(:dishes)
  end
end 
