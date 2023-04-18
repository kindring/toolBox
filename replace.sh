#!/bin/bash

#接收输入的参数
source_dir=$1
target_dir=$2

# 检查目标目录是否存在，不存在则创建
if [ ! -d "$target_dir" ]
then
echo "目标目录不存在,创建目录"
mkdir -p "$target_dir"
fi
echo "计算文件中..."
# cp -r "$source_dir" "$target_dir"
total=$(ls -1 "$source_dir"/* | wc -l)
# 遍历目录下的所有文件
for file in "$source_dir"/*
do
# 只处理文本文件，且不包括 classes.txt 文件
if [ -f "$file" ] && [ $(file -b --mime-type "$file") = "text/plain" ] && [ $(basename "$file") != "classes.txt" ]
then
count=$((count+1))
# 将换行符修改为Windows兼容形式
filename=$(basename "$file")
echo "正在处理文件 $file $count/$total"
cp "$file" "$target_dir"/"$filename"
sed -i 's/$/\r/' "$target_dir"/"$filename"
else
echo "跳过文件 $file"
fi
done

echo "拷贝完成,并修改换行符为Windows兼容形式。\n 数据源地址: $source_dir ,目标地址: $target_dir "
