#!/usr/bin/env python3
"""Install, run, or check Rehearse's upstream Pipecat server (stdlib only)."""
import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

PACKAGE = 'pipecat-ai-mcp-server==0.0.12'
ENDPOINT = 'http://localhost:9090/mcp'
TOOLS = {'start', 'speak', 'listen', 'stop'}


def rpc(payload, session=None):
    headers = {'Content-Type': 'application/json',
               'Accept': 'application/json, text/event-stream'}
    if session:
        headers['Mcp-Session-Id'] = session
    request = Request(ENDPOINT, data=json.dumps(payload).encode(), headers=headers)
    with urlopen(request, timeout=5) as response:
        session = response.headers.get('Mcp-Session-Id', session)
        if response.status == 202:
            return None, session
        if 'text/event-stream' in response.headers.get('Content-Type', ''):
            # Stop after the first complete event; the stream may stay open.
            data = []
            size = 0
            for line in response:
                size += len(line)
                if size > 1_000_000:
                    raise ValueError('MCP response exceeds 1 MB')
                line = line.decode().rstrip('\r\n')
                if line.startswith('data:'):
                    data.append(line[5:].lstrip())
                if not line and data:
                    break
            result = json.loads('\n'.join(data))
        else:
            body = response.read(1_000_001)
            if len(body) > 1_000_000:
                raise ValueError('MCP response exceeds 1 MB')
            result = json.loads(body)
        if not isinstance(result, dict) or 'error' in result:
            raise ValueError('MCP returned an invalid response or protocol error')
        if result.get('id') != payload.get('id'):
            raise ValueError('MCP response ID does not match the request')
        return result.get('result'), session


def check():
    session = None
    try:
        info, session = rpc({'jsonrpc': '2.0', 'id': 1, 'method': 'initialize',
                             'params': {'protocolVersion': '2024-11-05',
                                        'capabilities': {},
                                        'clientInfo': {'name': 'rehearse-check', 'version': '1.0'}}})
        if not isinstance(info, dict) or info.get('serverInfo', {}).get('name') != 'pipecat-mcp-server':
            raise ValueError('Endpoint is not the expected Pipecat MCP server')
        rpc({'jsonrpc': '2.0', 'method': 'notifications/initialized'}, session)
        result, _ = rpc({'jsonrpc': '2.0', 'id': 2, 'method': 'tools/list'}, session)
        available = {tool['name'] for tool in result['tools']}
        if not TOOLS <= available:
            raise ValueError('Missing voice tools: ' + ', '.join(sorted(TOOLS - available)))
        print(f'Pipecat MCP ready at {ENDPOINT}; start, speak, listen, stop available.')
        print('Audio is not tested. Start the voice agent, then connect at http://localhost:7860.')
    finally:
        if session:
            try:
                with urlopen(Request(ENDPOINT, method='DELETE',
                                     headers={'Mcp-Session-Id': session}), timeout=5):
                    pass
            except (OSError, HTTPError):
                pass  # Session cleanup must not hide the diagnostic result.


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['setup', 'start', 'check'])
    args = parser.parse_args()
    try:
        if args.action == 'check':
            check()
            return 0
        uv = shutil.which('uv')
        if not uv:
            raise ValueError('uv is required. Install it from https://docs.astral.sh/uv/getting-started/installation/ and rerun.')
        if args.action == 'setup':
            subprocess.run([uv, 'tool', 'install', '--python', '3.12', PACKAGE], check=True)
            print('Setup complete. Run this helper with start in a separate terminal, then check.')
            return 0
        # Resolve uv's executable directory rather than requiring it on PATH.
        result = subprocess.run([uv, 'tool', 'dir', '--bin'], check=True,
                                capture_output=True, text=True)
        executable = Path(result.stdout.strip()) / ('pipecat-mcp-server.exe' if os.name == 'nt' else 'pipecat-mcp-server')
        if not executable.is_file():
            raise ValueError('Pipecat is not installed through uv. Run this helper with setup first.')
        print(f'Starting Pipecat at {ENDPOINT}. Press Ctrl-C to stop.', flush=True)
        # Replace the helper so terminal interrupts go directly to the server.
        os.execv(str(executable), [str(executable)])
    except KeyboardInterrupt:
        return 130
    except subprocess.CalledProcessError as error:
        print(f'Pipecat {args.action} failed (exit {error.returncode}). Existing installations are not forcibly replaced.', file=sys.stderr)
        return error.returncode or 1
    except (OSError, ValueError, KeyError, TypeError, URLError) as error:
        print(f'Pipecat {args.action} failed: {error}', file=sys.stderr)
        if args.action == 'check':
            print('Run setup if needed, start the server in a separate terminal, then retry check. Reload the host MCP connection after startup.', file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
