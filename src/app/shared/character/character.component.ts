import { ChangeDetectionStrategy, Component } from '@angular/core';

/** The photographer who pops up at the end of every page, taking pictures. Purely decorative. */
@Component({
  selector: 'app-character',
  templateUrl: './character.component.html',
  styleUrl: './character.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterComponent {}
