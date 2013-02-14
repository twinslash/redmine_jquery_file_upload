resources :jquery_files, only: [:index, :new, :create, :destroy] do
  delete 'destroy_tempfolder', on: :member
end
put 'jquery_files', to: 'jquery_files#create'
