import { Injectable } from "@angular/core";
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})

export class CommonToasterService {

    constructor(private toastrService: ToastrService) { }

    showSuccess(title?: string, message?: string, configuration?: object) {
        this.toastrService.toastrConfig.preventDuplicates = true;
        this.toastrService.success(message, title, {
                    closeButton: true,
                    timeOut: 3000,
                    positionClass: 'toast-top-right',
                    tapToDismiss: true,
                    newestOnTop: true,
                });
    }

    showError(title?: string, message?: string, configuration?: object) {
        this.toastrService.toastrConfig.preventDuplicates = true;
        this.toastrService.error(message, title, {
                closeButton: true,
                timeOut: 3000,
                positionClass: 'toast-top-right',
                tapToDismiss: true,
                newestOnTop: true,
            });
    }

    showWarning(title?: string, message?: string, configuration?: object) {
        this.toastrService.toastrConfig.preventDuplicates = true;
        this.toastrService.warning(message, title, {
                closeButton: true,
                timeOut: 3000,
                positionClass: 'toast-top-right',
                tapToDismiss: true,
                newestOnTop: true,
            });
    }

    showInfo(title?: string, message?: string, configuration?: object) {
        this.toastrService.toastrConfig.preventDuplicates = true;
        this.toastrService.info(message, title, {
                closeButton: true,
                timeOut: 3000,
                positionClass: 'toast-top-right',
                tapToDismiss: true,
                newestOnTop: true,
            });
    }

    removeAllToasterOrById(toastId?: number) {
        toastId && toastId != null &&
        toastId != undefined ? this.toastrService.clear(toastId) : this.toastrService.clear();
    }
}