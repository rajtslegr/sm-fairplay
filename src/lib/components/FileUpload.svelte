<script lang="ts">
	import { FileSpreadsheet, Plus, Trash2, Upload, X } from 'lucide-svelte';
	import { cn } from '$lib/utils/cn';
	import type { UploadedFileInfo } from '$lib/stores/appStore.svelte';

	interface Props {
		onFileUpload: (files: File[]) => void;
		uploadedFiles: UploadedFileInfo[];
		onRemoveFile: (fileName: string) => void;
		onReset: () => void;
		totalPlayers: number;
		totalMatches: number;
	}

	let { onFileUpload, uploadedFiles, onRemoveFile, onReset, totalPlayers, totalMatches }: Props = $props();

	let fileInputRef = $state<HTMLInputElement>();
	let isDragging = $state(false);
	let dragCounter = 0;
	let hasFiles = $derived(uploadedFiles.length > 0);

	function handleClick() {
		fileInputRef?.click();
	}

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const files = Array.from(input.files ?? []).filter(isXlsxFile);
		if (files.length > 0) {
			onFileUpload(files);
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
		const files = Array.from(e.dataTransfer?.files ?? []).filter(isXlsxFile);
		if (files.length > 0) {
			onFileUpload(files);
		}
	}

	function handlePaste(e: ClipboardEvent) {
		const items = e.clipboardData?.items;
		if (items) {
			for (let i = 0; i < items.length; i++) {
				if (items[i].kind === 'file') {
					const file = items[i].getAsFile();
					if (file && isXlsxFile(file)) {
						onFileUpload([file]);
						e.preventDefault();
						break;
					}
				}
			}
		}
	}

	function isXlsxFile(file: File) {
		return (
			file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
			file.name.toLowerCase().endsWith('.xlsx')
		);
	}

	$effect(() => {
		window.addEventListener('paste', handlePaste);
		return () => window.removeEventListener('paste', handlePaste);
	});
</script>

<div class="mb-12 w-full max-w-xl">
	{#if hasFiles}
		<ul class="mb-3 space-y-2">
			{#each uploadedFiles as file (file.name)}
				<li class="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm">
					<FileSpreadsheet class="size-5 shrink-0 text-muted-foreground" />
					<span class="min-w-0 flex-1 truncate font-medium">{file.name}</span>
					<span class="shrink-0 text-xs text-muted-foreground">{file.playerCount} players · {file.matchCount} matches</span>
					<button
						type="button"
						onclick={() => onRemoveFile(file.name)}
						aria-label={`Remove ${file.name}`}
						class="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
					>
						<X class="size-4" />
					</button>
				</li>
			{/each}
		</ul>
		<div class="mb-3 flex items-center justify-between text-xs text-muted-foreground">
			<span>Total: {totalPlayers} players · {totalMatches} matches</span>
			<button type="button" onclick={onReset} class="flex items-center rounded px-2 py-1 text-xs text-muted-foreground hover:text-destructive">
				<Trash2 class="mr-1 size-3" />
				Discard all
			</button>
		</div>
	{/if}
	<div
		class={cn(
			'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card text-card-foreground shadow-sm transition-colors hover:border-primary hover:bg-primary/5',
			hasFiles ? 'min-h-20 p-4' : 'min-h-[200px] p-6',
			isDragging && 'border-primary bg-primary/10'
		)}
		onclick={handleClick}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				handleClick();
			}
		}}
		ondragenter={handleDragIn}
		ondragleave={handleDragOut}
		ondragover={handleDrag}
		ondrop={handleDrop}
		role="button"
		tabindex="0"
	>
		<div class="flex flex-col items-center gap-1 text-center">
			{#if hasFiles}
				<Plus class="size-5 text-muted-foreground" />
				<p class="text-xs text-muted-foreground">Click or drop another XLSX file</p>
			{:else}
				<Upload class="size-10 text-muted-foreground" />
				<p class="text-sm text-muted-foreground">
					Drop XLSX files here, click to select, or paste from clipboard
				</p>
				<p class="text-xs text-muted-foreground">Only .xlsx files are supported</p>
			{/if}
		</div>
		<input type="file" bind:this={fileInputRef} onchange={handleFileChange} accept=".xlsx" multiple class="hidden" />
	</div>
</div>
