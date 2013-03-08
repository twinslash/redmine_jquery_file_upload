resources :jquery_files, :only => [:index, :new, :create, :destroy] do
  delete 'destroy_tempfolder', :on => :member
  post 'crop', :on => :collection
end
put 'jquery_files', :to => 'jquery_files#create'
