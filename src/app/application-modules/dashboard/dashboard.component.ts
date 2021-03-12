import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Forecast } from '../../model/forecast';
import { AuthService, WeatherService } from '../../shared/shared.module';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  forecast: Forecast;
  subs: Subscription[] = [];

  constructor(
    private weatherService: WeatherService,
    private translate: TranslateService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.token$.subscribe(token => {
      if (token && token.location) {
        this.searchForecast(WeatherService.encodeQueryUrl(token.location));
      } else {
        new Promise(resolve => {
          if (navigator.geolocation) {
            resolve(navigator.geolocation
              .getCurrentPosition(position => this.searchForecast(position.coords.latitude + ',' + position.coords.longitude),
                err => this.searchForecast('')));
          } else {
            resolve(this.searchForecast(''));
          }
        });
      }
    });
  }

  searchForecast(location: string): void {
    this.weatherService.findForecastByLocation(location, '5', this.translate.currentLang)
      .then(forecast => this.forecast = forecast);
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe);
  }

}
