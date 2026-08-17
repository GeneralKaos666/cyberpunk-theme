import fs from 'node:fs/promises'
import path from 'node:path'
import { fileExists, backupAndCopy } from '../lib/fs-helpers.js'

export const id   = 'termux'
export const name = 'Termux'

const TERMUX_DIR    = path.join(process.env.HOME, '.termux')
const ACTIVE_FILE   = path.join(TERMUX_DIR, 'colors.properties')
const PICKER_DIR    = path.join(TERMUX_DIR, 'colors')
const THEME_FILES   = ['Cyberpunk Storm', 'Cyberpunk Night', 'Cyberpunk Neon']

/**
 * Returns true if Termux is present (colors.properties exists).
 *
 * @returns {Promise<boolean>}
 */
export async function detect() {
  return fileExists(ACTIVE_FILE)
}

/**
 * Installs the selected variant as the active Termux scheme and into the
 * scheme picker directory (~/.termux/colors/).
 *
 * @param {string} variant   - 'storm' | 'night' | 'neon'
 * @param {string} repoRoot  - Absolute path to the repository root
 * @param {{ dryRun?: boolean }} [opts]
 * @returns {Promise<{ message: string, postInstallMessage: string }>}
 */
export async function install(variant, repoRoot, opts = {}) {
  const srcDir       = path.join(repoRoot, 'extras', 'termux')
  const variantLabel = variant.charAt(0).toUpperCase() + variant.slice(1)
  const src          = path.join(srcDir, `Cyberpunk ${variantLabel}.properties`)

  if (!opts.dryRun) {
    await fs.mkdir(PICKER_DIR, { recursive: true })
  } else {
    console.log(`[dry-run] Would create directory: ${PICKER_DIR}`)
  }

  for (const file of THEME_FILES) {
    const dest = path.join(PICKER_DIR, `${file}.properties`)
    if (opts.dryRun) {
      console.log(`[dry-run] Would copy: ${path.join(srcDir, `${file}.properties`)} -> ${dest}`)
    } else {
      await fs.copyFile(path.join(srcDir, `${file}.properties`), dest)
    }
  }

  await backupAndCopy(src, ACTIVE_FILE, opts)

  return {
    message:            ACTIVE_FILE,
    postInstallMessage: 'Run `termux-reload-settings` (or restart Termux) to apply the new colors',
  }
}