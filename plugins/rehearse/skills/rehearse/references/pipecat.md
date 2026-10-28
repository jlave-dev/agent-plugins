# Pipecat voice transport

Use this reference when starting or diagnosing Pipecat voice. The skill owns the interview; the existing upstream server owns speech recognition, synthesis, and audio transport. No separate interviewer service or context index is needed.

## Setup

The plugin's `.mcp.json` connects to `http://localhost:9090/mcp` using Streamable HTTP. It does not install or launch the server. On a remote harness, localhost refers to that harness's host; do not assume it reaches the user's computer.

Use the bundled standard-library helper, resolving `<plugin-root>` from this installed skill's location (two directories above the skill folder):

```bash
python3 <plugin-root>/scripts/pipecat_server.py setup
python3 <plugin-root>/scripts/pipecat_server.py start
```

`setup` requires `uv` and installs `pipecat-ai-mcp-server==0.0.12` with Python 3.12 through `uv tool install`. uv can download that Python version if absent. It does not force replacement of conflicting installations, change host settings, or download speech models. If `uv` is absent, the helper prints its official installation link. Follow the host's normal tool-installation policy.

`start` resolves the executable through `uv tool dir --bin`, so uv's tool directory need not be on PATH. Run it in a separate persistent terminal; it runs in the foreground and Ctrl-C stops the server. Reuse an existing healthy server instead of starting another. This helper starts the installed uv tool; rerun setup to ensure the pinned package is installed. Do not register it as a stdio MCP command: upstream serves HTTP.

From another terminal, verify the MCP connection:

```bash
python3 <plugin-root>/scripts/pipecat_server.py check
```

`check` initializes an MCP session, verifies Pipecat's server identity and the four voice tools, and closes its diagnostic session. It never starts the audio pipeline. If the host previously failed to connect, reload/reconnect its MCP connection after startup; restart the host session if it cannot reload tools. A healthy check does not prove microphone, speaker, or model readiness.

Run setup when the user requests voice setup or authorizes installing the prerequisite. For an ordinary rehearsal without voice available, explain the option and use the channel fallback. The default pipeline uses local Whisper (MLX on macOS, Faster Whisper elsewhere) and Kokoro, with model downloads on the first audio connection. Customized deployments may use external speech providers; inspect their configuration before promising local processing. See the [upstream installation instructions](https://github.com/pipecat-ai/pipecat-mcp-server) for custom deployments.

Connect the browser microphone and speakers through Pipecat Playground at `http://localhost:7860` when the voice agent is started. MCP itself supplies neither microphone nor speaker access. Daily and phone transports are upstream alternatives, not requirements for this plugin.

If the host does not load the plugin's MCP configuration, register the same HTTP endpoint in its MCP settings. For Cursor, the plugin's `mcpServers` entry can be copied into its MCP configuration. For Claude Code:

```bash
claude mcp add pipecat --transport http http://localhost:9090/mcp --scope user
```

Avoid registering a second connection if the plugin already exposes the tools. The portable skill directory can also be used with another harness's supported skill loader; `agents/openai.yaml` is optional host metadata. This repository packages a Codex marketplace plugin, not a separately tested plugin package for every host.

Do not copy upstream examples that grant blanket shell, file-edit, or tool permissions just to enable voice. Use the host's existing permissions and narrow voice-tool grants where needed. Do not silently change global settings, audio devices, or provider configuration.

## Voice lifecycle

Resolve the actual Pipecat tool namespace and schemas exposed by the host. Upstream currently provides `start()`, `speak(text)`, `listen()`, and `stop()`; names may be prefixed by the harness. Verify availability rather than inventing calls. See the [server implementation](https://github.com/pipecat-ai/pipecat-mcp-server/blob/main/src/pipecat_mcp_server/server.py) and [upstream talk workflow](https://github.com/pipecat-ai/skills/blob/main/skills/talk/SKILL.md) for the current contract.

1. Prepare project context before opening audio. Tell the user where to connect and that initial model loading may take time.
2. Call `start()` once for a new session. If it fails, report the failure and offer text; do not report that the microphone is connected. If an existing Pipecat session is already active, reuse it rather than restarting it.
3. Call `speak(text)` with a short scenario introduction and one question, then `listen()` to receive the answer. The first response also verifies the audio path. Continue the question → listen → follow-up cycle while the session is active; do not end the agent turn after merely asking the first spoken question.
4. Keep spoken turns to one or two short sentences. `listen()` means the agent is ready for the user; finish necessary research or feedback before listening. If further research takes time, give a brief spoken update first.
5. Treat empty transcripts, timeouts, disconnections, and recognition failures as transport uncertainty. Keep the pending question; check once whether the user wants to reconnect or use text. Do not count missing audio as an incorrect answer or restart/listen in an unbounded error loop.
6. On an explicit stop or finish, acknowledge briefly and call `stop()` promptly. Do not require a second confirmation or delay cleanup for a long debrief. On normal completion, speak a short closing summary and stop the session. Report a cleanup failure plainly; do not claim it stopped successfully. If the user switches to text, stop the Pipecat session first.

Do not call Pipecat screen capture tools for rehearsal. Native voice and text modes need none of these lifecycle calls. Never stop an unrelated audio session when Pipecat was not used.
