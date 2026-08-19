'use client'

import { useRef, type ChangeEvent } from 'react'
import { Droplets, ImageIcon, PaintBucket, Upload, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Button } from '@/components/ui/button'
import { useBackground, type BackgroundMode } from '@/lib/background-store'

const SWATCHES = [
  'oklch(0.93 0.02 55)',
  'oklch(0.9 0.03 190)',
  'oklch(0.95 0.005 264)',
  'oklch(0.2 0.012 264)',
  'oklch(0.55 0.14 55)',
  'oklch(0.55 0.1 190)',
]

export function BackgroundSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { pref, setMode, setColor, setImage } = useBackground()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setImage(reader.result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>背景设置</DialogTitle>
          <DialogDescription>选择应用的全局背景样式，设置会保存在本设备上。</DialogDescription>
        </DialogHeader>

        <ToggleGroup
          value={[pref.mode]}
          onValueChange={(value: string[]) => {
            if (value[0]) setMode(value[0] as BackgroundMode)
          }}
          variant="outline"
          className="grid w-full grid-cols-3"
        >
          <ToggleGroupItem value="fluid" className="flex-col gap-1.5 py-3">
            <Droplets data-icon="inline-start" />
            流体
          </ToggleGroupItem>
          <ToggleGroupItem value="solid" className="flex-col gap-1.5 py-3">
            <PaintBucket data-icon="inline-start" />
            纯色
          </ToggleGroupItem>
          <ToggleGroupItem value="image" className="flex-col gap-1.5 py-3">
            <ImageIcon data-icon="inline-start" />
            图片
          </ToggleGroupItem>
        </ToggleGroup>

        {pref.mode === 'solid' && (
          <div className="flex flex-col gap-3">
            <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">选择颜色</p>
            <div className="flex flex-wrap items-center gap-2">
              {SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => setColor(swatch)}
                  aria-label={`选择颜色 ${swatch}`}
                  aria-pressed={pref.color === swatch}
                  className="size-8 rounded-full ring-1 ring-foreground/10 transition-transform data-[selected=true]:scale-110 data-[selected=true]:ring-2 data-[selected=true]:ring-ring"
                  data-selected={pref.color === swatch}
                  style={{ backgroundColor: swatch }}
                />
              ))}
              <label className="relative flex size-8 cursor-pointer items-center justify-center rounded-full border border-dashed border-border text-muted-foreground">
                <input
                  type="color"
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                  value={pref.color.startsWith('oklch') ? '#f4f1ea' : pref.color}
                  onChange={(e) => setColor(e.target.value)}
                  aria-label="自定义颜色"
                />
                <PaintBucket className="size-3.5" />
              </label>
            </div>
          </div>
        )}

        {pref.mode === 'image' && (
          <div className="flex flex-col gap-3">
            <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">上传图片</p>
            {pref.imageDataUrl ? (
              <div className="relative overflow-hidden rounded-lg border border-border">
                {/* Preview of the uploaded background; not decorative content. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pref.imageDataUrl} alt="已上传的背景图片预览" className="h-32 w-full object-cover" />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  className="absolute top-2 right-2"
                  onClick={() => setImage(null)}
                  aria-label="移除背景图片"
                >
                  <X />
                </Button>
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload data-icon="inline-start" />
                选择图片文件
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
              aria-hidden="true"
              tabIndex={-1}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
