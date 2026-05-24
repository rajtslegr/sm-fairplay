<script lang="ts">
	import { Upload } from 'lucide-svelte';
	import { cn } from '$lib/utils/cn';

	interface Props {
		onFileUpload: (file: File) => void;
	}

	let { onFileUpload }: Props = $props();

	let fileInputRef = $state<HTMLInputElement>();
	let isDragging = $state(false);
	let dragCounter = 0;

	function handleClick() {
		fileInputRef?.click();
	}

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			onFileUpload(file);
			if (fileInputRef) {
				fileInputRef.value = '';
			}
		}
	}

	function handleDrag(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
	}

	function handleDragIn(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		dragCounter += 1;
		if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
			isDragging = true;
		}
	}

	function handleDragOut(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		dragCounter -= 1;
		if (dragCounter === 0) {
			isDragging = false;
		}
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		isDragging = false;
		dragCounter = 0;
		const file = e.dataTransfer?.files[0];
		if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
			onFileUpload(file);
		}
	}

	function handlePaste(e: ClipboardEvent) {
		const items = e.clipboardData?.items;
		if (items) {
			for (let i = 0; i < items.length; i++) {
				if (items[i].kind === 'file') {
					const file = items[i].getAsFile();
					if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
						onFileUpload(file);
						e.preventDefault();
						break;
					}
				}
			}
		}
	}

	$effect(() => {
		window.addEventListener('paste', handlePaste);
		return () => window.removeEventListener('paste', handlePaste);
	});
</script>

<div class="mb-12">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class={cn(
			'flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-6 text-card-foreground shadow-sm transition-colors hover:border-primary hover:bg-primary/5',
			isDragging && 'border-primary bg-primary/10'
		)}
		onclick={handleClick}
		onkeydown={(e) => e.key === 'Enter' && handleClick()}
		ondragenter={handleDragIn}
		ondragleave={handleDragOut}
		ondragover={handleDrag}
		ondrop={handleDrop}
		role="button"
		tabindex="0"
	>
		<div class="flex flex-col items-center gap-2 text-center">
			<Upload class="size-10 text-muted-foreground" />
			<p class="text-sm text-muted-foreground">
				Drop XLSX file here, click to select, or paste from clipboard
			</p>
			<p class="text-xs text-muted-foreground">
				Only .xlsx files are supported
			</p>
		</div>
		<input type="file" bind:this={fileInputRef} onchange={handleFileChange} accept=".xlsx" class="hidden" />
	</div>
</div>
