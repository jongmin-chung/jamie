# Kill a process running on a specific port

```shell
kill -9 $(lsof -t -i:$PORT_NUM) 2>/dev/null || true
```
