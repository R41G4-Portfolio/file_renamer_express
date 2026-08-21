find . -type f -name "*.js" \
	! -path "./node_modules/*" \
	! -path "./.git/*" \
	! -path "./uploads/*" \
	-print0 |
sort -z |
while IFS= read -r -d '' file; do
	echo "// ${file#./}"
	cat "$file"
	echo
	echo
done > codigo-backend.txt