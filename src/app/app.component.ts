import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteFooterComponent } from './shared/site-footer/site-footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteFooterComponent],
  template: `
    <div class="shell">
      <router-outlet />
      <app-site-footer />
    </div>
  `,
  styles: `.shell{min-height:100vh;display:flex;flex-direction:column}app-site-footer{margin-top:auto}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
