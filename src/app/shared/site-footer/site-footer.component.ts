import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE } from '../../core/site.config';
import { CharacterComponent } from '../character/character.component';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink, CharacterComponent],
  templateUrl: './site-footer.component.html',
  styleUrl: './site-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooterComponent {
  protected readonly site = SITE;
  protected readonly year = new Date().getFullYear();
}
