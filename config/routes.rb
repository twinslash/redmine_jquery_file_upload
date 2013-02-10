# Plugin's routes
# See: http://guides.rubyonrails.org/routing.html

resources :jquery_files, only: [:index, :new, :create, :destroy]
put 'jquery_files', to: 'jquery_files#create'
