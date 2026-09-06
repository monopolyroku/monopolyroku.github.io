/*
	Terminal start screen.
	Visitors type `init` (+ Enter) or click the INIT button to load the portfolio.
*/

(function () {
	'use strict';

	var STORAGE_KEY = 'wqe-booted';
	var GITHUB_URL = 'https://github.com/monopolyroku';
	var boot = document.getElementById('boot');

	if (!boot) return;

	var body = document.body;
	var log = document.getElementById('boot-log');
	var typed = document.getElementById('boot-typed');
	var input = document.getElementById('boot-input');
	var initBtn = document.getElementById('boot-init-btn');
	var bootBody = boot.querySelector('.boot-body');

	var ready = false;
	var busy = false;

	var skip = false;
	try { skip = sessionStorage.getItem(STORAGE_KEY) === '1'; } catch (e) {}

	if (skip) {
		boot.parentNode.removeChild(boot);
		body.classList.remove('is-booting');
		return;
	}

	var bootLines = [
		{ text: 'WQE-BIOS v2.0.26  (C) monopolyroku', cls: 'dim' },
		{ text: 'Memory test: 65536 KB .......... ', cls: '', append: { text: 'OK', cls: 'ok' } },
		{ text: 'Detecting hardware ............. ', cls: '', append: { text: 'OK', cls: 'ok' } },
		{ text: '  > servo controller x12 ........ ', cls: '', append: { text: 'OK', cls: 'ok' } },
		{ text: '  > lidar / depth camera ........ ', cls: '', append: { text: 'OK', cls: 'ok' } },
		{ text: '  > ROS2 middleware ............. ', cls: '', append: { text: 'OK', cls: 'ok' } },
		{ text: 'Mounting /portfolio ............ ', cls: '', append: { text: 'OK', cls: 'ok' } },
		{ text: '', cls: '' },
		{ text: 'Welcome, visitor.', cls: 'cmd' },
		{ text: 'This terminal controls access to the portfolio of Qi En, robotics engineer.', cls: '' },
		{ text: '', cls: '' },
		{ text: "Type 'init' and press ENTER to load the portfolio, or click the button below.", cls: 'warn' },
		{ text: "Type 'help' for other commands.", cls: 'dim' }
	];

	var initLines = [
		{ text: 'Initialising portfolio ......... ', cls: '', append: { text: 'OK', cls: 'ok' } },
		{ text: 'Loading projects [6] ........... ', cls: '', append: { text: 'OK', cls: 'ok' } },
		{ text: 'Rendering 8-bit interface ...... ', cls: '', append: { text: 'OK', cls: 'ok' } },
		{ text: 'Have fun. Press any key to... nah, just scroll.', cls: 'cmd' }
	];

	function scrollLog() {
		if (bootBody) bootBody.scrollTop = bootBody.scrollHeight;
	}

	function appendSpan(text, cls) {
		var span = document.createElement('span');
		if (cls) span.className = cls;
		span.textContent = text;
		log.appendChild(span);
		scrollLog();
		return span;
	}

	function newline() {
		log.appendChild(document.createTextNode('\n'));
		scrollLog();
	}

	function typeLine(line, speed, done) {
		var span = appendSpan('', line.cls);
		var i = 0;

		function tick() {
			if (i < line.text.length) {
				span.textContent += line.text.charAt(i++);
				scrollLog();
				setTimeout(tick, speed);
			} else {
				if (line.append) appendSpan(line.append.text, line.append.cls);
				newline();
				done();
			}
		}

		tick();
	}

	function typeLines(lines, speed, gap, done) {
		var idx = 0;

		function next() {
			if (idx >= lines.length) return done && done();
			typeLine(lines[idx++], speed, function () {
				setTimeout(next, gap);
			});
		}

		next();
	}

	function echoCommand(cmd) {
		appendSpan('visitor@wqe-portfolio:~$ ', 'ok');
		appendSpan(cmd, 'cmd');
		newline();
	}

	function setReady(state) {
		ready = state;
		if (state) {
			boot.classList.add('is-ready');
			focusInput();
		} else {
			boot.classList.remove('is-ready');
		}
	}

	function focusInput() {
		if (!input) return;
		try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); }
	}

	function renderTyped() {
		typed.textContent = input.value;
	}

	function clearInput() {
		input.value = '';
		renderTyped();
	}

	function powerOff() {
		try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
		boot.classList.add('is-off');
		setTimeout(function () {
			if (boot.parentNode) boot.parentNode.removeChild(boot);
			body.classList.remove('is-booting');
		}, 500);
	}

	function runInit() {
		if (busy) return;
		busy = true;
		setReady(false);
		typeLines(initLines, 8, 120, function () {
			setTimeout(powerOff, 500);
		});
	}

	function handleCommand(raw) {
		var cmd = raw.trim().toLowerCase();
		echoCommand(raw);

		if (cmd === '') {
			return;
		}

		if (cmd === 'init' || cmd === 'start' || cmd === 'run' || cmd === 'load') {
			runInit();
			return;
		}

		if (cmd === 'help' || cmd === '?') {
			appendSpan('Available commands:\n', 'warn');
			appendSpan('  init     load the portfolio\n', '');
			appendSpan('  whoami   about the owner of this terminal\n', '');
			appendSpan('  ls       list what is inside\n', '');
			appendSpan('  clear    clear the screen\n', '');
			appendSpan('  exit     leave the terminal and go to my GitHub\n', '');
			appendSpan('  help     show this message\n', '');
			return;
		}

		if (cmd === 'whoami') {
			appendSpan('Wong Qi En (@monopolyroku) - robotics engineer working in military robotics and design.\n', '');
			appendSpan('Currently doing postgraduate studies in Singapore.\n', '');
			return;
		}

		if (cmd === 'ls' || cmd === 'dir') {
			appendSpan('chrd/  smartair/  limo/  lslr/  cellverse/  poly-fyp/  contact.txt\n', 'ok');
			return;
		}

		if (cmd === 'clear' || cmd === 'cls') {
			log.textContent = '';
			return;
		}

		if (cmd === 'sudo' || cmd.indexOf('sudo ') === 0) {
			appendSpan('visitor is not in the sudoers file. This incident will be reported.\n', 'err');
			return;
		}

		if (cmd === 'exit' || cmd === 'quit' || cmd === 'logout') {
			busy = true;
			setReady(false);
			typeLine({ text: 'logout ... redirecting to ' + GITHUB_URL, cls: 'warn' }, 10, function () {
				setTimeout(function () {
					window.location.href = GITHUB_URL;
				}, 600);
			});
			return;
		}

		appendSpan('bash: ' + cmd.split(' ')[0] + ": command not found. Try 'init'.\n", 'err');
	}

	function typeAndRun(cmd) {
		if (busy || !ready) return;
		busy = true;
		clearInput();
		var i = 0;

		function tick() {
			if (i < cmd.length) {
				input.value += cmd.charAt(i++);
				renderTyped();
				setTimeout(tick, 90);
			} else {
				setTimeout(function () {
					var value = input.value;
					clearInput();
					busy = false;
					handleCommand(value);
				}, 250);
			}
		}

		tick();
	}

	input.addEventListener('input', renderTyped);

	input.addEventListener('keydown', function (e) {
		if (!ready || busy) {
			if (e.key === 'Enter') e.preventDefault();
			return;
		}

		if (e.key === 'Enter') {
			e.preventDefault();
			var value = input.value;
			clearInput();
			handleCommand(value);
		}
	});

	document.addEventListener('keydown', function (e) {
		if (!boot.parentNode) return;
		if (e.ctrlKey || e.metaKey || e.altKey) return;
		if (document.activeElement !== input && e.key.length === 1) {
			focusInput();
		}
	});

	boot.addEventListener('click', function (e) {
		if (e.target === initBtn) return;
		if (ready) focusInput();
	});

	initBtn.addEventListener('click', function (e) {
		e.preventDefault();
		typeAndRun('init');
	});

	setTimeout(function () {
		typeLines(bootLines, 6, 90, function () {
			setReady(true);
		});
	}, 300);
})();
