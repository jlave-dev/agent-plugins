# VoiceMode voice transport

Read this when setting up voice or running the spoken rehearsal. The host agent owns project reasoning and coaching; VoiceMode supplies direct microphone capture, speech recognition, and speaker playback through MCP. No browser audio page is needed.

## One-time setup

The plugin's `.mcp.json` launches `uvx --from voice-mode==9.0.2 voicemode-mcp-launcher` as a stdio server. The host owns that process's lifecycle. `uv` must be installed and `uvx` available to the host's environment; restart the host after installation if needed. See [uv installation](https://docs.astral.sh/uv/getting-started/installation/).

Use [VoiceMode's upstream installer](https://github.com/mbailey/voicemode/blob/master/.claude/commands/install.md) rather than a plugin-maintained installer:

```bash
uvx voice-mode-install --yes
uvx --from voice-mode==9.0.2 voicemode service install whisper
uvx --from voice-mode==9.0.2 voicemode service install kokoro
```

Run installation when the user requests voice setup or authorizes installing the prerequisite. The installer provisions system dependencies such as FFmpeg and PortAudio; service installation downloads local models and may register/start background services. Use the platform-specific upstream instructions when prerequisites fail. Do not overwrite an existing customized deployment or repeatedly reinstall to diagnose microphone problems.

Check the local services:

```bash
uvx --from voice-mode==9.0.2 voicemode service status whisper
uvx --from voice-mode==9.0.2 voicemode service status kokoro
```

If installed but stopped, start the required service with `voicemode service start whisper` or `voicemode service start kokoro` through the same pinned `uvx --from` prefix. Reconnect the host's MCP connection after setup; restart the host session if it cannot reload tools. Service status and an MCP connection do not prove audio works. Verify with one short spoken question and a returned answer when the user is ready.

VoiceMode uses the machine's audio devices. Allow OS microphone access for the process or application named in the permission dialog. On a remote harness, the default audio devices belong to the remote host; this setup does not relay a local laptop microphone over SSH. Native voice or text remains available when direct audio is inappropriate.

## Configuration and other harnesses

The plugin configures local Whisper at `http://127.0.0.1:2022/v1` and Kokoro at `http://127.0.0.1:8880/v1`, with no cloud endpoint in the fallback lists. Audio, transcription, debug, and event saving are disabled for the plugin process. These settings do not change global VoiceMode configuration or the host's normal chat history. Other endpoints or recording require an explicit user choice; do not silently add a cloud fallback when local services fail.

If the host does not load this plugin's MCP configuration, copy its `voicemode` server entry from `.mcp.json`, including `args` and `env`, into the host's supported MCP settings. Avoid a duplicate connection when VoiceMode is already exposed. An existing VoiceMode instance may have different provider and logging settings: inspect those before promising local processing or no saved recordings. This repository supplies Codex marketplace packaging; the skill itself is portable Markdown.

Do not change global tool permissions to enable voice. Use existing permissions or narrow voice-tool grants. Do not install the upstream Claude-specific hooks or sound effects just to run Rehearse in another harness.

## Conversation loop

Resolve the actual VoiceMode `converse` tool and its schema exposed by the host. See the [upstream tool implementation](https://github.com/mbailey/voicemode/blob/master/voice_mode/tools/converse.py) and [voice workflow](https://github.com/mbailey/voicemode/blob/master/.claude/skills/voicemode/SKILL.md). Names may be prefixed; do not invent calls or use Pipecat's start/listen/stop API.

1. Research the project before opening the microphone. Call `converse(message="<brief introduction and one question>")`. By default it speaks, listens, and returns the user's response in the tool result.
2. Use that response as the next rehearsal answer, then call `converse` with one adaptive follow-up. Keep the loop active instead of ending the agent turn after the first spoken question. Do not use a prewritten multi-question survey: each next question depends on the answer.
3. For a progress update or closing summary without listening, set `wait_for_response=false`. After an update, resume with another listening call when ready. Keep spoken turns to one or two short sentences; put the full debrief in chat.
4. Leave voice, listening ceiling, and silence-detection defaults at the user's settings. Allow pauses, restarts, and thinking time. Do not interpret an empty transcript, timeout, or recognition failure as a knowledge gap. Clarify once and preserve the pending question; if the device/provider remains unavailable, report the failure and continue in text rather than retrying indefinitely.
5. On an explicit stop/finish, end the loop promptly. If useful, send one brief closing utterance with `wait_for_response=false`; do not call again to listen or require another confirmation. Cancel an in-flight listening tool through the host if supported. There is no separate Pipecat-style stop call. Do not shut down shared Whisper/Kokoro services merely because one rehearsal ended.

Use an already active native voice channel instead of starting a second audio channel. VoiceMode setup and lifecycle calls are unnecessary in native voice or text mode.
