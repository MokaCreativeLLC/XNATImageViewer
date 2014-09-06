require 'compass/import-once/activate'
# Require any additional compass plugins here.

# Set this to the root of your project when deployed:
http_path = "/"
css_dir = "viewer"
sass_dir = "viewer"
add_import_path "viewer"
#images_dir = "images"
#javascripts_dir = "javascripts"

# You can select your preferred output style here (can be overridden via the command line):
# output_style = :expanded or :nested or :compact or :compressed

# To enable relative paths to assets via compass helper functions. Uncomment:
# relative_assets = true

# To disable debugging comments that display the original location of your selectors. Uncomment:
# line_comments = false


# If you prefer the indented syntax, you might want to regenerate this
# project again passing --syntax sass, or you can uncomment this:
# preferred_syntax = :sass
# and then run:
# sass-convert -R --from scss --to sass sass scss && rm -rf sass && mv scss sass

output_style = :expanded

require 'pathname'
require 'fileutils'
on_stylesheet_saved do |file|
  if File.exists?(file)
    filename = File.basename(file, File.extname(file))
    filename = filename.to_str

    newUri = Pathname.new(file).to_s
    newUri = Pathname.new(newUri).dirname.to_s
    newUri = Pathname.new(newUri).dirname.to_s

    
    newUri += '/css/' + filename + '.min' + File.extname(file).to_s + "\n"
    if File.exists?(newUri)
      File.delete(newUri)
    end

    #File.rename(file, File.basename(newUri).to_s)
    #File.rename(file, newUri) 
    FileUtils.mv(file, Pathname.new(newUri).dirname)
    #print Pathname.new(newUri).dirname.to_s + "\n"
    #File.rename(Pathname.new(newUri).dirname.to_s + '/' + \
    #            File.basename(file).to_s, newUri)

    print "    moved to: " + newUri + "\n"
  end
end
