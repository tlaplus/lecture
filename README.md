## One-liner to replace the original URLs pointing to external mp4s with relative URLs pointing to local mp4s:

```
sed -i '' -E 's/".*\/(smintla|init2|video[0-9]{1,2}|video[0-9]{1,2}(a|b){0,1}(v2){0,1})(_mid){0,1}\.mp4"/"\1.mp4"/g' *.html
```